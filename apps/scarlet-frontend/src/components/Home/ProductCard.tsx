'use client';
import React from 'react';
import { Card } from '@/components/ui/card';

interface ProductCardProps {
    // Define component props here
}

const ProductCard: React.FC<ProductCardProps> = (props) => {
    return (
        <div>
            <Card className="relative overflow-hidden w-[300px] h-[500px] py-0">
                <img
                    src="https://images.unsplash.com/photo-1736606355698-5efdb410fe93?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="image placeholder"
                    className="w-full h-full object-cover"
                />
            </Card>

            <div className="mt-2">
                <div className="text-lg font-semibold">Product Name</div>
                <div className="text-sm text-muted-foreground">Category</div>
            </div>
        </div>
    );
};

export default ProductCard;
