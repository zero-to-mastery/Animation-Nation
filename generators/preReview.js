const fs = require("node:fs/promises")

/* Github Actions values to use */
const contributorHandle = process.env.GITHUB_HANDLE || ''
const changedFilesStr = process.env?.CHANGED_FILES || ''
const canChangeAnyFiles = [ 'admin', 'maintain' ].includes(process.env?.GITHUB_PERMISSION_ROLE || '')


/* Helpers */
const createFeedbacks = (feedbacks = [], mode = 'line') => {
    return (message) => {
        const feedback = mode == 'task' ? `- [ ] ${message}` : message
        feedbacks.push(feedback)
    }
}

/* ------------------------------------ - ----------------------------------- */

/** Establishes a state about the contribution */
const getContributionState = () => {
    const changedFiles      = changedFilesStr.split(" ").filter(Boolean) || []

    const requiredRegexp  = /(index.html|styles.css|meta.json)$/

    // Separates changed file to "incorrectFiles" or "correctFiles"
    const fileCorrectness   = changedFiles.reduce((details, file) => {
        const detailsProperty = requiredRegexp.test( file )? details.correctFiles : details.incorrectFiles
            detailsProperty.push( file )
            return details
    }, { incorrectFiles: [], correctFiles: []})

    const state = {
        changedFiles,
        ...fileCorrectness
    }
    return state
}



/** Review HTML file - returning an array of feedbacks */
const reviewHTMLFile = (file, fileContent) => {
  const feedbacks = []
  if (!file.endsWith('.html')) return feedbacks
  const feedbackPush = createFeedbacks(feedbacks, 'task')

  const hasJS = /<script\b[^>]*>/i.test(fileContent)
  const hasCSS = fileContent.includes('.css')
  const hasCorrectStylesheet = /<link\s+[^>]*href=["']styles\.css["'][^>]*>/i.test(fileContent)

  // Check any JS content
  if (hasJS) {
    feedbackPush(`Remove any JavaScript content in the HTML file: \`${file}\``)
  }

  // Check CSS link tag: exists or incorrect name
  if (!hasCSS) {
    feedbackPush('Missing linked stylesheet file: link the CSS file to your HTML')
  } else if(!hasCorrectStylesheet){
     feedbackPush('Incorrect stylesheet link: update the href to point to the correct CSS file')
  }

  // If any feedbacks, prepends a feedback title
  if (feedbacks.length) feedbacks.unshift('### HTML feedbacks')
  return feedbacks
}

/** Review CSS file - returning an array of feedbacks */
const reviewCSSFile = (file, fileContent) => {
    const feedbacks = []
    if (!file.includes('.css')) return;
    const feedbackPush = createFeedbacks(feedbacks, 'task')

    // CSS animation(s) check
    const hasCSSAnimation = /@keyframes/gi.test(fileContent)
    if( !fileContent ){
        feedbackPush(`Missing content, add the code for the file \`${file}\``)
        
    } else if( !hasCSSAnimation ){
        feedbackPush('Add animation(s) using the `@keyframes` and `animation` properties in your CSS')
    }



    if(feedbacks.length) feedbacks.unshift('### CSS feedbacks')
    return feedbacks
}

/** Review JSON file - returning an array of feedbacks */
const reviewJSONFile = (file, fileContent) => {
    const feedbacks = []
    if (!file.includes('.json')) return;

    const feedbackPush = createFeedbacks(feedbacks, 'task')

    // Meta checks
    const contributorRegexp = new RegExp(contributorHandle, 'i')
    const hasMetaArtNameValue = /"artName":\s*".+"/gi.test(fileContent)
    const hasMetaGithubHandleValue = /"githubHandle"\s*:\s*".+?"/gi.test(fileContent)
    
    const hasCorrectMetaGithubHandle = contributorRegexp.test(fileContent)


    !hasMetaArtNameValue && feedbackPush('Missing artName: add an "artName"')
    if( hasMetaGithubHandleValue && !hasCorrectMetaGithubHandle ){
        feedbackPush('Unmatched github handler: adjust your `githubHandle`')
    } else if ( !hasMetaGithubHandleValue ){
        feedbackPush('Missing github handle: add your github handle in `githubHandle`')
    }

    if(feedbacks.length) feedbacks.unshift('### JSON feedbacks')
    return feedbacks
}


const reviewContribution = (contributionStates) => {
    const feedbacks = []
    const feedbackPush = createFeedbacks(feedbacks, 'task')

    const { correctFiles, incorrectFiles } = contributionStates
    const allFiles = [...correctFiles, ...incorrectFiles ]

    // Unecessary files
    const folderRegexp = new RegExp(`^Art/${contributorHandle}`, 'i')

    // Handle incorrect files
    for (const file of incorrectFiles){
        const hasValidFolderName = folderRegexp.test(file)

        if(!canChangeAnyFiles){
            // File(s) outside of the Art folder for the animation contribution
            if(!hasValidFolderName){
                feedbacks.push("Contribution out `Art/` folder scope:")
                feedbackPush(`Remove unnecessary file: \`${file}\``)
            } else { // Incorrect file names in Art contribution folder
                feedbackPush(`Rename your file as recommended: \`${file}\``)
            }
        }
    }        

    if(feedbacks.length) feedbacks.unshift('### Other feedbacks')
    return feedbacks
    
}

const checkContent = async (contributionStates) => {
    let feedbacks = []
    const feedbackPush = createFeedbacks(feedbacks, 'task')

    const { incorrectFiles, correctFiles } = contributionStates
    const changedFiles = [ ...incorrectFiles, ...correctFiles ]
    let HTMLReviews = [], CSSReviews = [], JSONReviews = []

    // Checks
    for( const file of changedFiles ){
        if (!file) continue;
        let fileContent = await fs.readFile(file, 'utf-8')
      
        if(!fileContent){
            feedbackPush(`Missing content, add the code for the file \`${file}\``)
        } else {
            HTMLReviews   = [ ...HTMLReviews, ...(reviewHTMLFile(file, fileContent)  || []) ]
            CSSReviews    = [ ...CSSReviews, ...(reviewCSSFile(file, fileContent)   || []) ]
            JSONReviews   = [ ...JSONReviews, ...(reviewJSONFile(file, fileContent)  || []) ]
        }
    }

    feedbacks = [
        ...feedbacks,
        ...HTMLReviews,
        ...CSSReviews,
        ...JSONReviews,
    ]

    const otherReviews  = reviewContribution(contributionStates)
    return ([
        ...feedbacks,
        ...otherReviews
    ])
}

const generateReviewMessage = (feedbacks ) => {
    const messageLines = [`Aloha @${contributorHandle} 🙌 Thanks for your contribution!`]
    const messagePush = createFeedbacks(messageLines, 'line')


    if( feedbacks.length ) {
        messagePush("Before we could merge, please address the following:")
        messagePush("## Feedbacks")

        const taskList = feedbacks.join("\n")
        messagePush(`${ taskList }`)
    } else {
        messagePush("\n🎉 Your submission seems to meet all requirements")
        messagePush("and is now awaiting final validation from a maintainer.")
    }

    
    messageLines.push( "\nHappy Coding! 🚀")
    const messageReview = messageLines.join("\n")
    return messageReview
}

;(async () => {
    const contributionState = getContributionState()
    const feedbacks = await checkContent(contributionState)
    const PRFinalReview = generateReviewMessage(feedbacks)
    console.info(PRFinalReview)
})()