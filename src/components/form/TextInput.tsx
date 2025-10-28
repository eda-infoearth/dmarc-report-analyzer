interface inputProps {
  label?: string;
  onChange: (value: string) => void;
};

export const TextInput = (props: inputProps) => {
  return (
    <>
      {props.label 
      ? <div class="grid grid-cols-10 gap-2 items-center">
        <label class="col-start-1 col-end-4">{props.label}</label>
        <input 
          type="text" 
          class="rounded border-2 border-dashed border-pink-300 p-4 col-start-4 col-end-11" 
          onChange={(e) => props.onChange(e.target.value)} 
        />
      </div> 
      : <input 
        type="text" 
        class="rounded border-2 border-dashed border-pink-300 p-4" 
        onChange={(e) => props.onChange(e.target.value)} 
      />}
    </>
  );
};