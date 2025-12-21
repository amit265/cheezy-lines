
export const timeLapse = (pastDate) => {
  const now = new Date();
  // console.log("Now:", now);
  // console.log("Past Date:", pastDate);  

  const past = new Date(pastDate);
  const diffInMs = now - past;



  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  // last week
  if (diffInDays < 7) return `${diffInDays} days ago`;
  // beyond last week
  if (diffInDays >= 7 && diffInDays < 30)
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays >= 30 && diffInDays < 365)
    return `${Math.floor(diffInDays / 30)} months ago`;

  return `${diffInDays} day(s) ago`;
};
