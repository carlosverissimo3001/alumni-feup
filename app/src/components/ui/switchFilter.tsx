import React from 'react';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

const SwitchFilter: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
        style={{ display: 'none' }}
      />
      <span
        style={{
          width: 40,
          height: 20,
          borderRadius: 10,
          backgroundColor: checked ? '#991b1b' : '#ccc',
          position: 'relative',
          transition: 'background-color 0.3s',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: checked ? 20 : 0,
            top: 0,
            width: 20,
            height: 20,
            backgroundColor: '#fff',
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: '#18181b',
            borderRadius: '50%',
            transition: 'left 0.3s',
          }}
        />
      </span>
      {label && <span style={{ marginLeft: 8 }}>{label}</span>}
    </label>
  );
};

export default SwitchFilter;