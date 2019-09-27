import React from "react"
import { graphql } from "gatsby"
import { TimelineMax, Back, Power1 } from "gsap"
import TransitionLink, { TransitionPortal } from "gatsby-plugin-transition-link"
import Layout from "../components/layout"
import SEO from "../components/seo"

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
          }
        }
      }
    }
  }
`

class Index extends React.Component {
  constructor(props) {
    super(props)

    this.horizontal = this.horizontal.bind(this)
    this.vertical = this.vertical.bind(this)

    this.cover = React.createRef()
    this.mod = React.createRef()
  }

  horizontal = ({ length: seconds }, direction) => {
    const directionTo = direction === "left" ? "-100%" : "100%"
    const directionFrom = direction === "left" ? "100%" : "-100%"

    // convert ms to s for gsap
    // const seconds = length
    const half = seconds / 2

    return new TimelineMax()
      .set(this.cover, { y: 0, x: directionFrom, display: "block" })
      .to(this.cover, half, {
        x: "0%",
        ease: Power1.easeInOut,
      })
      .to(this.cover, half, {
        x: directionTo,
        ease: Power1.easeInOut,
      })
  }

  vertical = ({ length: seconds }, direction) => {
    const directionTo = direction === "up" ? "-100%" : "100%"
    const directionFrom = direction === "up" ? "100%" : "-100%"

    const half = seconds / 2

    return new TimelineMax()
      .set(this.cover, { y: directionFrom })
      .to(this.cover, half, {
        y: "0%",
        ease: Power1.easeInOut,
      })
      .set(this.mod, { opacity: 0 })
      .to(this.cover, half, {
        y: directionTo,
        ease: Power1.easeIn,
      })
  }

  moveInDirection = (props, direction) => {
    if (direction === "left" || direction === "right")
      return this.horizontal(props, direction)

    return this.vertical(props, direction)
  }

  char(node) {
    return new TimelineMax().staggerFrom(
      node.querySelectorAll(".char, p span"),
      0.5,
      { ease: Back.easeOut, opacity: 0, y: "+=50" },
      0.05
    )
  }

  render() {
    const { data } = this.props
    const posts = data.allMarkdownRemark.edges

    return (
      <Layout>
        <SEO title="Home" />
        <ol className="blog-list" ref={n => (this.mod = n)}>
          {posts.map(edge => {
            return (
              <li key={edge.node.fields.slug}>
                <h2>
                  <TransitionLink
                    to={`/${edge.node.fields.slug}`}
                    exit={{
                      length: 1,
                      trigger: ({ exit }) => this.moveInDirection(exit, "left"),
                      // state: { char: "exit state" },
                    }}
                    entry={{
                      delay: 0.5,
                      trigger: ({ node }) => this.char(node),
                    }}
                  >
                    {edge.node.frontmatter.title}
                  </TransitionLink>
                </h2>
                <p>{edge.node.frontmatter.date}</p>
              </li>
            )
          })}
        </ol>
        <TransitionPortal>
          <div
            ref={n => (this.cover = n)}
            style={{
              position: "fixed",
              background: "#8c61ff",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              transform: "translateY(100%)",
            }}
          />
        </TransitionPortal>
      </Layout>
    )
  }
}

export default Index
