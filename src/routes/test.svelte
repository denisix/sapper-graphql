<script>
  import gql from "graphql-tag";
  import { onMount } from "svelte";

  let random = 0;
  let randoms = 0;
  onMount(() => {
      
    const { client } = window;

    client
      .query({
        query: gql`
          {
            random
          }
        `
      })
      .then(result => {
        random = result.data.random;
      });

    client
      .subscribe({
        query: gql`
          subscription {
            randoms
          }
        `
      })
      .subscribe(result => {
        randoms = result.data.randoms;
      });
  });
</script>

<svelte:head>
  <title>Test GraphQL</title>
</svelte:head>

<h1>GraphQL Test here..</h1>

<p>Check what we see here.</p>

<div>
  Random: {random}
  <br />
  Randoms: {randoms}
</div>
