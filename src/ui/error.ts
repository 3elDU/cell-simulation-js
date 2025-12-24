export async function showErrorScreen(title: string, description: string) {
  alert(title + "\n" + description);
  location.reload();
}
