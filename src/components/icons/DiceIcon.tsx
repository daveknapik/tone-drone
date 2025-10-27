/**
 * Dice icon component (5-pip die)
 * Uses currentColor to inherit text color from parent
 */
function DiceIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 485 485"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path d="M0,0v485h485V0H0z M455,455H30V30h425V455z" />
        <path d="M118.75,401.25c19.299,0,35-15.701,35-35s-15.701-35-35-35s-35,15.701-35,35S99.451,401.25,118.75,401.25z" />
        <path d="M118.75,153.75c19.299,0,35-15.701,35-35s-15.701-35-35-35s-35,15.701-35,35S99.451,153.75,118.75,153.75z" />
        <path d="M242.5,277.5c19.299,0,35-15.701,35-35s-15.701-35-35-35s-35,15.701-35,35S223.201,277.5,242.5,277.5z" />
        <path d="M366.25,401.25c19.299,0,35-15.701,35-35s-15.701-35-35-35s-35,15.701-35,35S346.951,401.25,366.25,401.25z" />
        <path d="M366.25,153.75c19.299,0,35-15.701,35-35s-15.701-35-35-35s-35,15.701-35,35S346.951,153.75,366.25,153.75z" />
      </g>
    </svg>
  );
}

export default DiceIcon;
