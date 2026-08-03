export const tournamentDisplayName = (sessionOrName) => {
  const name = typeof sessionOrName === 'string'
    ? sessionOrName
    : sessionOrName?.tournamentName

  return name?.trim() || '이름 없는 토너먼트'
}
