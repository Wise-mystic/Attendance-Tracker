import React from 'react';
import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Switch,
    FormControlLabel
} from '@mui/material';

const FormInput = ({
    type = 'text',
    name,
    label,
    value,
    onChange,
    error,
    options = [],
    required = false,
    disabled = false,
    fullWidth = true,
    ...props
}) => {
    switch (type) {
        case 'select':
            return (
                <FormControl 
                    fullWidth={fullWidth} 
                    error={Boolean(error)}
                    required={required}
                    disabled={disabled}
                >
                    <InputLabel>{label}</InputLabel>
                    <Select
                        name={name}
                        value={value}
                        onChange={onChange}
                        label={label}
                        {...props}
                    >
                        {options.map(option => (
                            <MenuItem 
                                key={option.value} 
                                value={option.value}
                            >
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                    {error && <FormHelperText>{error}</FormHelperText>}
                </FormControl>
            );

        case 'switch':
            return (
                <FormControlLabel
                    control={
                        <Switch
                            checked={value}
                            onChange={onChange}
                            name={name}
                            disabled={disabled}
                            {...props}
                        />
                    }
                    label={label}
                />
            );

        default:
            return (
                <TextField
                    type={type}
                    name={name}
                    label={label}
                    value={value}
                    onChange={onChange}
                    error={Boolean(error)}
                    helperText={error}
                    required={required}
                    disabled={disabled}
                    fullWidth={fullWidth}
                    {...props}
                />
            );
    }
};

export default FormInput; 