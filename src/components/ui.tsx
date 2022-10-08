export const Button: ParentFc<{
  onClick: JSX.MouseEventHandler<HTMLButtonElement>;
}> = ({ children, onClick }) => {
  return (
    <button
      className="rounded-md border border-slate-300 px-3 py-1"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const Checkbox: Fc<{
  name: string;
  checked: boolean;
  onChange: JSX.GenericEventHandler<HTMLInputElement>;
  color?: string;
}> = ({ name, checked, onChange, color }) => {
  console.log(name, checked, color);

  return (
    <label>
      <div
        className="cursor-pointer rounded-full border border-gray-500 px-3 py-1.5"
        style={checked ? `background-color: ${color}; color: black` : undefined}
      >
        {name}
      </div>
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={onChange}
      />
    </label>
  );
};

export const FileUpload: Fc<{
  onUpload: (file: File) => void;
}> = ({ onUpload }) => {
  const onChange: JSX.GenericEventHandler<HTMLInputElement> = (event) => {
    const files = (event.target as HTMLInputElement)?.files;
    if (!files) return;
    const file = files[0];
    if (!file) return;
    onUpload(file);
  };

  return (
    <input
      className="
        block
        h-full
        w-full
        cursor-pointer
        rounded-full
        border
        border-gray-300
        bg-gray-50
        p-4
        align-middle
        text-sm
        text-gray-900
        file:hidden
        dark:border-gray-600
        dark:bg-gray-700
        dark:text-gray-400
        dark:placeholder-gray-400
      "
      type="file"
      onChange={onChange}
    />
  );
};
