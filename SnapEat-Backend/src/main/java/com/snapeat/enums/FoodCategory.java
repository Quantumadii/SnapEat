package com.snapeat.enums;

public enum FoodCategory {
    STARTER, MAIN_COURSE, BEVERAGES, SNACKS, CHINESE, RICE, ADD_ONS;

    public String getLabel() {
        return switch (this) {
            case STARTER     -> "Starters";
            case MAIN_COURSE -> "Main Course";
            case BEVERAGES   -> "Beverages";
            case SNACKS      -> "Snacks";
            case CHINESE     -> "Chinese";
            case RICE        -> "Rice";
            case ADD_ONS     -> "Add Ons";
        };
    }
}
