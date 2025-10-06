import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();
  return (
    <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1546536133-d1b07a9c768e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmclMjBtb2RlbHxlbnwxfHx8fDE3NTc4ODQ3NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        alt="Fashion hero"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 text-center text-white max-w-2xl px-4">
        <h1 className="text-5xl lg:text-6xl mb-6">
          New Season
          <br />
          <span className="italic">Collection</span>
        </h1>
        <p className="text-xl mb-8 opacity-90">
          Discover the latest trends in fashion with our carefully curated
          collection
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-black hover:bg-gray-100 shadow-lg"
            onClick={() => navigate("/women")}
          >
            Shop Women
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-black bg-transparent shadow-lg"
            onClick={() => navigate("/men")}
          >
            Shop Men
          </Button>
        </div>
      </div>
    </div>
  );
}
