// pages/index.js
import countries from "@/data/countries.json";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">World Travel Explorer</h1>
      <ul className="list-disc pl-5 space-y-2">
        {Object.entries(countries).map(([id, country]) => (
          <li key={id}>
            <Link href={`/country/${id}`} className="text-blue-600 hover:underline">
              {country.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
