export function rawToGitHubUrl(url: string): string {
  const pattern =
    /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/refs\/heads\/([^/]+)\/(.+)$/;
  const match = pattern.exec(url);

  if (!match) {
    return url;
  }

  const [, owner, repo, branch, path] = match;

  if (!owner || !repo || !branch || !path) {
    return url;
  }

  return `https://github.com/${owner}/${repo}/blob/${branch}/${path}`;
}
