import { MathJaxContext } from 'better-react-mathjax'

export const MathJaxProvider: React.FC<{
  enableMathRendering: boolean | null | undefined
  children: React.ReactNode
}> = ({ enableMathRendering, children }) => {
  if (!enableMathRendering) return children
  return <MathJaxContext>{children}</MathJaxContext>
}
