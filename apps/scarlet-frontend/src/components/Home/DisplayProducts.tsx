import ProductCard from './ProductCard';

interface DisplayProductsProps {
    // Define component props here
}

const DisplayProducts: React.FC<DisplayProductsProps> = (props) => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Example Product Card */}
            <ProductCard />
        </div>
    );
};

export default DisplayProducts;
