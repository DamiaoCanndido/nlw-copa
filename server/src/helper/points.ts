export const pointsHelper = (
  firstTeamPointsPredict: number,
  secondTeamPointsPredict: number,
  firstTeamPointsScore: number,
  secondTeamPointsScore: number,
): number => {
  if (
    firstTeamPointsPredict == firstTeamPointsScore &&
    secondTeamPointsPredict == secondTeamPointsScore
  ) {
    return 3;
  }
  if (
    (firstTeamPointsScore > secondTeamPointsScore &&
      firstTeamPointsPredict > secondTeamPointsPredict) ||
    (firstTeamPointsScore < secondTeamPointsScore &&
      firstTeamPointsPredict < secondTeamPointsPredict) ||
    (firstTeamPointsScore == secondTeamPointsScore &&
      firstTeamPointsPredict == secondTeamPointsPredict)
  ) {
    return 1;
  }
  return 0;
};
