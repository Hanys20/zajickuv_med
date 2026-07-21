import type { Availability } from '@/lib/products';

export default function Badge({ availability }: { availability: Availability }) {
  return availability === 'sold-out' ? (
    <span className="badge badge-sold-out">Vyprodáno</span>
  ) : (
    <span className="badge badge-available">Skladem</span>
  );
}
