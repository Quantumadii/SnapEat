package com.snapeat.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapeat.dto.DashboardStats;
import com.snapeat.dto.OrderItemResponse;
import com.snapeat.dto.OrderResponse;
import com.snapeat.dto.PaginatedResponse;
import com.snapeat.dto.PlaceOrderRequest;
import com.snapeat.entity.Branch;
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
import com.snapeat.repository.BranchRepository;
import com.snapeat.repository.MenuItemRepository;
import com.snapeat.repository.OrderRepository;
import com.snapeat.repository.RestaurantRepository;
import com.snapeat.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepo;
    private final MenuItemRepository menuRepo;
    private final RestaurantRepository restaurantRepo;
        private final BranchRepository branchRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;

    @Override
	public OrderResponse placeOrder(String email, PlaceOrderRequest req) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Restaurant restaurant = restaurantRepo.findById(req.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", req.getRestaurantId()));

        Branch branch = null;
        if (req.getBranchId() != null) {
            branch = branchRepo.findByIdAndRestaurantId(req.getBranchId(), restaurant.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Branch", req.getBranchId()));
        }
        final Branch selectedBranch = branch;

        String fullAddress = req.getFlatNo() + ", " + req.getDeliveryArea()
                + ", " + req.getDeliveryCity() + " - " + req.getPincode();

        PaymentMethod paymentMethod = req.getPaymentMethod() != null
                ? req.getPaymentMethod()
                : PaymentMethod.COD;

        PaymentStatus paymentStatus = PaymentStatus.PENDING;

        Order order = Order.builder()
                .user(user)
                .restaurant(restaurant)
                .branch(selectedBranch)
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

            boolean allowedInRestaurant = menuItem.getRestaurant() != null
                    && menuItem.getRestaurant().getId().equals(restaurant.getId());
            boolean allowedInBranch = menuItem.getBranch() == null
                    || (selectedBranch != null && menuItem.getBranch().getId().equals(selectedBranch.getId()));

            if (!allowedInRestaurant || !allowedInBranch) {
                throw new ResourceNotFoundException("MenuItem", itemReq.getMenuItemId());
            }

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

                if (paymentMethod == PaymentMethod.COD) {
                        emailService.sendOrderConfirmation(order);
                }
        return toResponse(order);
    }

//    @Override
//	public PaginatedResponse<OrderResponse> getMyOrders(String email) {
//        User user = userRepo.findByEmail(email)
//                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
//        return orderRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
//                .stream().map(this::toResponse).toList();
        
    @Override
    public PaginatedResponse<OrderResponse> getMyOrders(
            String email, int page, int size, String sortBy) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        // Create Pageable with sorting
        Sort.Direction direction = Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, 
            Sort.by(direction, sortBy));
        
        // Get paginated data
        Page<Order> orderPage = orderRepo.findByUserIdOrderByCreatedAtDesc(
            user.getId(), pageable);
        
        // Convert to response DTOs
        List<OrderResponse> content = orderPage.getContent()
            .stream()
            .map(this::toResponse)
            .toList();
        
        // Build paginated response
        return PaginatedResponse.<OrderResponse>builder()
            .content(content)
            .pageNumber(orderPage.getNumber())
            .pageSize(orderPage.getSize())
            .totalElements(orderPage.getTotalElements())
            .totalPages(orderPage.getTotalPages())
            .isFirst(orderPage.isFirst())
            .isLast(orderPage.isLast())
            .hasNext(orderPage.hasNext())
            .hasPrevious(orderPage.hasPrevious())
            .build();
    }

    
    @Override
	public OrderResponse getById(Long id) {
        return toResponse(orderRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id)));
    }

    @Override
	public PaginatedResponse<OrderResponse> getRestaurantOrders(Long restaurantId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepo.findVisibleByRestaurantIdOrderByCreatedAtDesc(
                restaurantId,
                PaymentMethod.STRIPE,
                PaymentStatus.PAID,
                pageable);
        List<OrderResponse> content = orderPage.getContent().stream().map(this::toResponse).toList();
        return PaginatedResponse.<OrderResponse>builder()
            .content(content)
            .pageNumber(orderPage.getNumber())
            .pageSize(orderPage.getSize())
            .totalElements(orderPage.getTotalElements())
            .totalPages(orderPage.getTotalPages())
            .isFirst(orderPage.isFirst())
            .isLast(orderPage.isLast())
            .hasNext(orderPage.hasNext())
            .hasPrevious(orderPage.hasPrevious())
            .build();
    }

    @Override
	public PaginatedResponse<OrderResponse> getRestaurantOrdersByStatus(Long restaurantId, OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepo.findVisibleByRestaurantIdAndStatusOrderByCreatedAtDesc(
                restaurantId,
                status,
                PaymentMethod.STRIPE,
                PaymentStatus.PAID,
                pageable);
        List<OrderResponse> content = orderPage.getContent().stream().map(this::toResponse).toList();
        return PaginatedResponse.<OrderResponse>builder()
            .content(content)
            .pageNumber(orderPage.getNumber())
            .pageSize(orderPage.getSize())
            .totalElements(orderPage.getTotalElements())
            .totalPages(orderPage.getTotalPages())
            .isFirst(orderPage.isFirst())
            .isLast(orderPage.isLast())
            .hasNext(orderPage.hasNext())
            .hasPrevious(orderPage.hasPrevious())
            .build();
    }

    @Override
	public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
    	Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (order.getPaymentMethod() == PaymentMethod.STRIPE
                && order.getPaymentStatus() != PaymentStatus.PAID
                && newStatus != OrderStatus.CANCELLED) {
            throw new OrderStatusException("Cannot update order status before successful online payment");
        }

        OrderStatus currentStatus = order.getStatus();
                if (newStatus == OrderStatus.CANCELLED) {
                        if (currentStatus == OrderStatus.CANCELLED) {
                                return toResponse(order);
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

        if (!isValidTransition(currentStatus, newStatus)) {
            throw new OrderStatusException(
                    "Invalid status transition: " + currentStatus + " -> " + newStatus);
        }

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

        private boolean isValidTransition(OrderStatus currentStatus, OrderStatus newStatus) {
                if (currentStatus == newStatus) {
                        return true;
                }

                return switch (currentStatus) {
                        case PLACED -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
                        case CONFIRMED -> newStatus == OrderStatus.PREPARING || newStatus == OrderStatus.CANCELLED;
                        case PREPARING -> newStatus == OrderStatus.READY || newStatus == OrderStatus.CANCELLED;
                        case READY -> newStatus == OrderStatus.COMPLETED;
                        case COMPLETED, CANCELLED -> false;
                };
        }

    @Override
	public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!isCustomerCancellationAllowed(order)) {
            throw new OrderStatusException(
                    "Cannot cancel order with status: " + order.getStatus()
                    + " for this restaurant's cancellation policy.");
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
        long pendingOrders = orderRepo.countByRestaurantIdAndStatus(restaurantId, OrderStatus.PLACED)
                + orderRepo.countByRestaurantIdAndStatus(restaurantId, OrderStatus.CONFIRMED);
        return DashboardStats.builder()
                .totalOrders(orderRepo.countByRestaurantId(restaurantId))
                .pendingOrders(pendingOrders)
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
                .branchId(o.getBranch() != null ? o.getBranch().getId() : null)
                .branchName(o.getBranch() != null ? o.getBranch().getBranchName() : null)
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
                                .canCancel(isCustomerCancellationAllowed(o))
                .orderItems(itemResponses)
                .build();
    }

        private boolean isCustomerCancellationAllowed(Order order) {
                OrderStatus currentStatus = order.getStatus();
                if (currentStatus == OrderStatus.CANCELLED || currentStatus == OrderStatus.COMPLETED) {
                        return false;
                }

                OrderStatus allowedTill = order.getRestaurant().getCustomerCancellationAllowedTill();
                if (allowedTill == null) {
                        allowedTill = OrderStatus.PREPARING;
                }

                return getProgressRank(currentStatus) <= getProgressRank(allowedTill);
        }

        private int getProgressRank(OrderStatus status) {
                return switch (status) {
                        case PLACED -> 1;
                        case CONFIRMED -> 2;
                        case PREPARING -> 3;
                        case READY -> 4;
                        case COMPLETED -> 5;
                        case CANCELLED -> 6;
                };
        }
}
