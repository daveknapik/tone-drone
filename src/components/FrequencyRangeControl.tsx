interface FrequencyRangeControlProps {
  className?: string;
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  maxFreq: number;
  minFreq: number;
}

function FrequencyRangeControl({
  className,
  handleFormSubmit,
  maxFreq,
  minFreq,
}: FrequencyRangeControlProps) {
  return (
    <form className={"col-span-6 " + className} onSubmit={handleFormSubmit}>
      <input
        className="w-20 mr-2 rounded-md border-0 bg-white px-1 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
        defaultValue={minFreq}
        max="20000"
        min="0.01"
        name="minFreq"
        step="0.01"
        type="number"
      />
      <input
        className="w-20 mr-2 rounded-md border-0 bg-white px-1 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
        defaultValue={maxFreq}
        max="20000"
        min="0.01"
        name="maxFreq"
        step="0.01"
        type="number"
      />
      <input
        className="rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        type="submit"
        value="freq!"
      />
    </form>
  );
}

export default FrequencyRangeControl;
