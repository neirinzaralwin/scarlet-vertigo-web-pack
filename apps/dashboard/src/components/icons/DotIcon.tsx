import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const DotIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2" {...props}>
        <circle cx="12" cy="12" r="6" />
    </svg>
);

export default DotIcon;
