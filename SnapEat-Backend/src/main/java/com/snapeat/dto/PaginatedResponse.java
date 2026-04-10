package com.snapeat.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class PaginatedResponse<T> {
   private List<T> content;           
    private int pageNumber;           
    private int pageSize; 
  private long totalElements;        
  private int totalPages;            
  private boolean isFirst;           
  private boolean isLast;            
  private boolean hasNext;           
  private boolean hasPrevious;  
  
}
