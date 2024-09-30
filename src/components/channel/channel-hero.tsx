import { format } from "date-fns";

type ChannelHeroProps = {
  name: string;
  creationTime: number;
};

export function ChannelHero({ name, creationTime }: ChannelHeroProps) {
  return (
    <div className="mt-[88px] mx-5 mb-4">
      <p className="text-2xl font-bold flex items-center mb-2"># {name}</p>
      <p className="font-normal text-slate-800">
        This channel was created on{" "}
        {format(new Date(creationTime), "dd MMMM, yyyy")}. This is the beginning
        of the <strong>{name}</strong> channel.
      </p>
    </div>
  );
}
