import { redirect } from "next/navigation";

// Step 1 is the only surface built so far. Land on the cascade setup.
export default function Home() {
  redirect("/cascade");
}
