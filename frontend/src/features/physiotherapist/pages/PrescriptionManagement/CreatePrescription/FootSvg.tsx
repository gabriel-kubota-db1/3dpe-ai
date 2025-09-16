import React from 'react';

const FootSvg = ({ values }: { values: any }) => {
  const activeStyle = { fill: '#1B4B71', opacity: 0.6 };
  const defaultStyle = { fill: '#ccc', transition: 'fill 0.3s ease' };

  return (
    <div style={{ textAlign: 'center', margin: '24px 0' }}>
      <svg width="400" height="400" viewBox="0 0 400 400">
        {/* Left Foot */}
        <g id="left-foot" transform="translate(50, 50)">
          <path d="M 50,0 C 20,80 20,180 60,280 C 100,290 140,250 150,200 C 160,100 100,0 50,0 Z" style={defaultStyle} />
          <circle cx="85" cy="240" r="20" style={values.calcaneus_left ? activeStyle : defaultStyle} />
          <ellipse cx="90" cy="150" rx="40" ry="20" style={values.transverse_arch_left ? activeStyle : defaultStyle} />
          <path d="M 60,50 C 70,100 70,150 65,200" stroke={values.medial_longitudinal_arch_left ? '#1B4B71' : '#aaa'} strokeWidth="10" fill="none" />
          <path d="M 130,80 C 120,130 120,180 125,230" stroke={values.lateral_longitudinal_arch_left ? '#1B4B71' : '#aaa'} strokeWidth="10" fill="none" />
          <circle cx="60" cy="30" r="10" style={values.cic_left ? activeStyle : defaultStyle} />
          <circle cx="130" cy="60" r="10" style={values.cavr_left ? activeStyle : defaultStyle} />
        </g>
        {/* Right Foot */}
        <g id="right-foot" transform="translate(200, 50) scale(-1, 1) translate(-150, 0)">
          <path d="M 50,0 C 20,80 20,180 60,280 C 100,290 140,250 150,200 C 160,100 100,0 50,0 Z" style={defaultStyle} />
          <circle cx="85" cy="240" r="20" style={values.calcaneus_right ? activeStyle : defaultStyle} />
          <ellipse cx="90" cy="150" rx="40" ry="20" style={values.transverse_arch_right ? activeStyle : defaultStyle} />
          <path d="M 60,50 C 70,100 70,150 65,200" stroke={values.medial_longitudinal_arch_right ? '#1B4B71' : '#aaa'} strokeWidth="10" fill="none" />
          <path d="M 130,80 C 120,130 120,180 125,230" stroke={values.lateral_longitudinal_arch_right ? '#1B4B71' : '#aaa'} strokeWidth="10" fill="none" />
          <circle cx="60" cy="30" r="10" style={values.cic_right ? activeStyle : defaultStyle} />
          <circle cx="130" cy="60" r="10" style={values.cavr_right ? activeStyle : defaultStyle} />
        </g>
      </svg>
    </div>
  );
};

export default FootSvg;
