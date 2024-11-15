import { HTMLInputTypeAttribute } from 'react';
import { useFormContext } from 'react-hook-form';

interface InputProps {
  name: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  bgColor?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({
  name,
  label,
  type = 'text',
  bgColor = 'bg-slate-100',
  value,
  onChange,
}: InputProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <label className="block mb-2 text-slate-500 text-sm" htmlFor={name}>
        {label}
      </label>
      <input
        {...register(name, { required: true })}
        type={type}
        value={value}
        onChange={onChange}
        className={`${bgColor} w-full focus:outline-amber-500 rounded p-3`}
      />
      {errors[name] && (
        <p data-cy="plates-error-text" className="text-red-400 pt-2 ml-1">
          {name} cannot be empty.
        </p>
      )}
    </div>
  );
};

export default Input;
