interface ParticipantCountProps {
  count: number;
}

export function ParticipantCount({ count }: ParticipantCountProps) {
  const formatCount = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}М`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}К`;
    return num.toString();
  };

  return <span>{formatCount(count)} участников</span>;
}
