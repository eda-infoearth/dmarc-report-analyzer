
interface ButtonProps {
  label: string;
  type?: "primary" | "secondary" | "warning" | "danger" | "back" | "cute";
  disabled?: boolean;
  onClick: () => void;
};

export const Button = (props: ButtonProps) => {
  const buttonType = () => {
    switch (props.type) {
      case "primary":
        return "bg-blue-500 text-white";
      case "secondary":
        return "bg-gray-500 text-white";
      case "warning":
        return "bg-yellow-500 text-black";
      case "danger":
        return "bg-red-500 text-white";
      case "back":
        return "bg-gray-300 text-black";
      case "cute":
        return "bg-pink-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  return (
    <button
      class={`px-4 py-2 rounded ${props.disabled ? "bg-gray-200 text-gray-400" : buttonType()}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.label}
    </button>
  );
};