package com.snapeat.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {
	
	private long totalOrders;
    private long pendingOrders;
    private long preparingOrders;
    private long completedOrders;
    private long cancelledOrders;
    private BigDecimal dailyRevenue;
    private long totalMenuItems;
    private List<OrderResponse> recentOrders;
}
