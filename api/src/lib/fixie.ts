import { getContactBySidekickTitle, mapHubspotContactToContact } from "./hubspot";
export let getFixieChunks = async ({message, sideKickTitle}) => {
  // the way this works, is we need the fixie, corpus id;
  // this data is stored in the hubspot contact
  // let assume we'll ahve a getContactBySidekickTitle
  let contact = await getContactBySidekickTitle({ title: sideKickTitle });
  let mappedContact = mapHubspotContactToContact({ contact });
  // mappedContact has the fixieCorpusId
  // now we can get the fixieChunks
  let fixieBody = {
    corpusId: mappedContact.fixieCorpusId,
    query: message,
    maxChunks: 3,
    rerankResults: "RERANK_RESULTS_UNSPECIFIED"
  };
  let fixieOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.FIXIE_API_KEY}`
    },
    body: JSON.stringify(fixieBody)
  };
  let fixieUrl = `https://api.fixie.ai/api/v1/corpora/${mappedContact.fixieCorpusId}/query`;
  const response = await fetch(fixieUrl, fixieOptions);
  const data = await response.json();
  /**
  [
    {
      chunkContent: string,
      score: number, (0.0 - 1.0) (1.0 is best)
      citation: {
        sourceId: string,
        documentId: string,
        publicUrl: string,
        title: string
      }
    },
    { ... }
  ]
   */
  return data.results;
}
// Great!
// the other thing we need is a way to get the messages,
// that's handled on hubspot's api today... but maybe we should store that in our own db?
export let getSourcesByFixieCorpusId = async ({ fixieCorpusId }) => {
  let fixieOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.FIXIE_API_KEY}`
    },
    //body: JSON.stringify(fixieBody)
  };
  let fixieUrl = `https://api.fixie.ai/api/v1/corpora/${fixieCorpusId}/sources`;
  const response = await fetch(fixieUrl, fixieOptions);
  const data = await response.json();
  //console.log(`getSourcesByFixieCorpusId: data: ${JSON.stringify(data)}`)
  return data.sources;
}

export let refreshSource = async ({ fixieCorpusId, sourceId }) => {
  let fixieBody = {
    corpusId: fixieCorpusId,
    sourceId: sourceId
  }
  let fixieOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.FIXIE_API_KEY}`
    },
    body: JSON.stringify(fixieBody)
  };
  let fixieUrl = `https://api.fixie.ai/api/v1/corpora/${fixieCorpusId}/sources/${sourceId}/refresh`;
  const response = await fetch(fixieUrl, fixieOptions);
  const data = await response.json();
  return data;
}
