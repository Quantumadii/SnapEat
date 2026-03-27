package com.snapeat.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.snapeat.dto.DashboardStats;
import com.snapeat.dto.OrderItemResponse;
import com.snapeat.dto.OrderResponse;
import com.snapeat.dto.PlaceOrderRequest;
import com.snapeat.entity.MenuItem;
import com.snapeat.entity.Order;
import com.snapeat.entity.OrderItem;
import com.snapeat.entity.Restaurant;
import com.snapeat.entity.User;
import com.snapeat.enums.OrderStatus;
import com.snapeat.enums.PaymentMethod;
import com.snapeat.enums.PaymentStatus;
import com.snapeat.exception.OrderStatusException;
import com.snapeat.exception.ResourceNotFoundException;
import com.snapeat.repository.MenuItemRepository;
import com.snapeat.repository.OrderRepository;
import com.snapeat.repository.RestaurantRepository;
import com.snapeat.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepo;
    private final MenuItemRepository menuRepo;
    private final RestaurantRepository restaurantRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;

    @Override
	public OrderResponse placeOrder(String email, PlaceOrderRequest req) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Restaurant restaurant = restaurantRepo.findById(req.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", req.getRestaurantId()));

        String fullAddress = req.getFlatNo() + ", " + req.getDeliveryArea()
                + ", " + req.getDeliveryCity() + " - " + req.getPincode();

        PaymentMethod paymentMethod = req.getPaymentMethod() != null
                ? req.getPaymentMethod()
                : PaymentMethod.COD;

        PaymentStatus paymentStatus = PaymentStatus.PENDING;

        Order order = Order.builder()
                .user(user)
                .restaurant(restaurant)
                .status(OrderStatus.PLACED)
                .flatNo(req.getFlatNo())
                .deliveryArea(req.getDeliveryArea())
                .deliveryCity(req.getDeliveryCity())
                .pincode(req.getPincode())
                .deliveryAddress(fullAddress)
                .specialInstructions(req.getSpecialInstructions())
                .paymentMethod(paymentMethod)
                .paymentStatus(paymentStatus)
                .totalAmount(BigDecimal.ZERO)
                .build();

        order = orderRepo.save(order);

        final Order savedOrder = order;
        List<OrderItem> items = req.getItems().stream().map(itemReq -> {
            MenuItem menuItem = menuRepo.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "MenuItem", itemReq.getMenuItemId()));

            BigDecimal subtotal = menuItem.getPrice()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            return OrderItem.builder()
                    .order(savedOrder)
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .subtotal(subtotal)
                    .itemNameSnapshot(menuItem.getName())
                    .itemPriceSnapshot(menuItem.getPrice())
                    .build();
        }).toList();

        order.setOrderItems(new ArrayList<>(items));
        BigDecimal total = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(total);
        order = orderRepo.save(order);

        emailService.sendOrderConfirmation(order);
        return toResponse(order);
    }

    @Override
	public List<OrderResponse> getMyOrders(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return orderRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
	public OrderResponse getById(Long id) {
        return toResponse(orderRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id)));
    }

    @Override
	public List<OrderResponse> getRestaurantOrders(Long restaurantId) {
        return orderRepo.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream().map(this::toResponse).toList();
    }

    @Override
	public List<OrderResponse> getRestaurantOrdersByStatus(Long restaurantId, OrderStatus status) {
        return orderRepo.findByRestaurantIdAndStatusOrderByCreatedAtDesc(restaurantId, status)
                .stream().map(this::toResponse).toList();
    }

    @Override
	public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
    	Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        order.setStatus(newStatus);
        order = orderRepo.save(order);
        
        emailService.sendOrderStatusUpdate(
            order.getUser().getEmail(), 
            order.getUser().getFullName(), 
            order.getId(), 
            order.getStatus()
        );
        
        return toResponse(order);
    }

    @Override
	public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (order.getStatus() != OrderStatus.PLACED
                && order.getStatus() != OrderStatus.PREPARING) {
            throw new OrderStatusException(
                    "Cannot cancel order with status: " + order.getStatus()
                    + ". Only PLACED or PREPARING orders can be cancelled.");
        }
        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepo.save(order);
        
        emailService.sendOrderStatusUpdate(
            order.getUser().getEmail(), 
            order.getUser().getFullName(), 
            order.getId(), 
            order.getStatus()
        );
        
        return toResponse(order);
    }
    
    @Override
	public DashboardStats getDashboard(Long restaurantId) {
        var startOfDay = LocalDate.now().atStartOfDay();
        return DashboardStats.builder()
                .totalOrders(orderRepo.countByRestaurantId(restaurantId))
                .pendingOrders(orderRepo.countByRestaurantIdAndStatus(
                        restaurantId, OrderStatus.PLACED))
                .preparingOrders(orderRepo.countByRestaurantIdAndStatus(
                        restaurantId, OrderStatus.PREPARING))
                .completedOrders(orderRepo.countByRestaurantIdAndStatus(
                        restaurantId, OrderStatus.COMPLETED))
                .cancelledOrders(orderRepo.countByRestaurantIdAndStatus(
                        restaurantId, OrderStatus.CANCELLED))
                .dailyRevenue(orderRepo.getDailyRevenue(restaurantId, startOfDay))
                .totalMenuItems(menuRepo.countByRestaurantIdAndAvailableTrue(restaurantId))
                .recentOrders(orderRepo.findRecentByRestaurant(restaurantId)
                        .stream().map(this::toResponse).toList())
                .build();
    }

    private OrderResponse toResponse(Order o) {
        List<OrderItemResponse> itemResponses = o.getOrderItems() == null
                ? List.of()
                : o.getOrderItems().stream().map(i -> OrderItemResponse.builder()
                        .id(i.getId())
                        .menuItemId(i.getMenuItem() != null ? i.getMenuItem().getId() : null)
                        .menuItemName(i.getItemNameSnapshot())
                        .menuItemImage(i.getMenuItem() != null ? i.getMenuItem().getImageUrl() : null)
                        .quantity(i.getQuantity())
                        .itemPrice(i.getItemPriceSnapshot())
                        .subtotal(i.getSubtotal())
                        .build())
                		.toList();

        return OrderResponse.builder()
                .id(o.getId())
                .userId(o.getUser().getId())	
                .customerName(o.getUser().getFullName())
                .customerEmail(o.getUser().getEmail())
                .restaurantId(o.getRestaurant().getId())
                .restaurantName(o.getRestaurant().getName())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus())
                .flatNo(o.getFlatNo())
                .deliveryArea(o.getDeliveryArea())
                .deliveryCity(o.getDeliveryCity())
                .pincode(o.getPincode())
                .deliveryAddress(o.getDeliveryAddress())
                .specialInstructions(o.getSpecialInstructions())
                .paymentMethod(o.getPaymentMethod())
                .paymentStatus(o.getPaymentStatus())
                .stripePaymentIntentId(o.getStripePaymentIntentId())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .orderItems(itemResponses)
                .build();
    }
}
