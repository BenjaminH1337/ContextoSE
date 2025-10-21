interface GuessInputProps {
  value: string;
  onChange: (value: string) => void;
  onGuess: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}

const GuessInput = ({ value, onChange, onGuess, onKeyPress, disabled }: GuessInputProps) => {
  return (
    <div className="mb-6">
      <div className="flex space-x-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          disabled={disabled}
          placeholder="Skriv ditt ord här..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={onGuess}
          disabled={disabled || !value.trim()}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Gissa
        </button>
      </div>
    </div>
  );
};

export default GuessInput;
