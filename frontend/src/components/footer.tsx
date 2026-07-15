import cvsuLogo from "../assets/cvsulogo.png"
const Footer = () => {
  return (
    <footer className="flex w-full mx-auto text-center justify-center items-center mb-6">
      <img src={ cvsuLogo } className="h-5 w-5 mr-3" />
      <span className="text-gray-500 text-sm"> Created by CvSU Interns. All Rights Reserved 2025. </span>
    </footer>
  )
}

export default Footer
