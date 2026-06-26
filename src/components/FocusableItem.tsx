
import React from 'react';
import * as NoriginNavModule from '@noriginmedia/norigin-spatial-navigation';

const NoriginNav = (NoriginNavModule as any).default || NoriginNavModule;
const { useFocusable } = NoriginNav;

interface FocusableItemProps {
  children: (props: { focused: boolean }) => React.ReactElement;
  onEnterPress?: () => void;
  onFocus?: () => void;
  focusKey?: string;
  className?: string;
}

const FocusableItem: React.FC<FocusableItemProps> = ({ 
  children, 
  onEnterPress, 
  onFocus, 
  focusKey, 
  className = '' 
}) => {
  const { ref, focused } = useFocusable({
    onEnterPress,
    onFocus,
    focusKey
  });

  return (
    <div ref={ref} className={`outline-none ${className}`}>
      {children({ focused })}
    </div>
  );
};

export default FocusableItem;
