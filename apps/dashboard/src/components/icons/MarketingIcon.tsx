import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const MarketingIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.63 2.25a14.98 14.98 0 0 0-11.96 14.98 14.98 14.98 0 0 0 14.98 11.96c1.4 0 2.73-.19 4-.53m.38-10.06a7.5 7.5 0 0 0-7.5-7.5 7.5 7.5 0 0 0-7.5 7.5c0 3.86 2.87 7.02 6.59 7.38v-4.8m.91-2.58a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5Z"
        />
    </svg>
);

export default MarketingIcon;
