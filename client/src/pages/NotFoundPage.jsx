import { Link } from "react-router-dom";
import { SceneLottie } from "../components/SceneLottie";
import { LOTTIE } from "../utils/format";
import { Button } from "../components/ui";

export function NotFoundPage() {
  return (
    <div className="paper-grid grid min-h-screen place-items-center p-8 text-center">
      <div>
        <SceneLottie src={LOTTIE.error} className="mx-auto h-48 w-48" />
        <h1 className="display mt-4 text-5xl">This desk is empty</h1>
        <p className="mt-2 text-ink/50">The route does not exist in Arclight.</p>
        <Link to="/app">
          <Button className="mt-6">Back to overview</Button>
        </Link>
      </div>
    </div>
  );
}
