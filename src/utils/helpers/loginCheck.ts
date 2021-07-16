const isLoggedIn = () => {
  const JWT = localStorage.getItem('persistJWT')
  if (JWT == undefined) return false
  return JWT !== null
}

export default isLoggedIn
