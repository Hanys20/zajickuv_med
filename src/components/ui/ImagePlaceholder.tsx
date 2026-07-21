type Props = {
  label: string;
  className?: string;
};

export default function ImagePlaceholder({ label, className = '' }: Props) {
  return (
    <div className={`imgph ${className}`}>
      <span>{label}</span>
    </div>
  );
}
