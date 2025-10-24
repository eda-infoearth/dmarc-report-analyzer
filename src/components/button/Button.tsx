
interface ButtonProps {
  label: string;
  onClick: () => void;
};

export const Button = (props: ButtonProps) => {
  return (
    <button class="px-4 py-2 bg-blue-500 text-white rounded" onClick={props.onClick}>
      {props.label}
    </button>
  );
};