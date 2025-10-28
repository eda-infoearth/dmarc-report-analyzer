interface FileDropProps {
  label?: string;
  onChange: (e: Event) => void;
}

export const FileDrop = (props: FileDropProps) => {
  return (
    <>
      {props.label 
      ? <div class="grid grid-cols-10 gap-2 items-center">
        <label class="col-start-1 col-end-4">{props.label}</label>
        <div class="rounded border-2 border-dashed border-pink-300 px-4 py-2 col-start-4 col-end-11">
          <input 
            type="file" 
            multiple 
            class="w-full bg-pink-300 py-2 rounded"
            onChange={props.onChange} 
          />
        </div>
      </div>
      : <div class="rounded border-2 border-dashed border-pink-300 px-4 py-2">
        <input 
          type="file" 
          multiple 
          class="w-full bg-pink-300 py-2 rounded"
          onChange={props.onChange} 
        />
      </div>}
    </>
  );
};