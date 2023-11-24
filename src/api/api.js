const baseUrl = "https://marcar.ru/rest";

export async function getCars (id) {
  try {
    const res = await fetch(`${baseUrl}/products?parent=${id}`);
    const data = await res.json();

    return data?.results || [];
  } catch (err) {
    console.log(err)
  }
}

export async function getModels(id) {
  try {
    const res = await fetch(`${baseUrl}/categories?parent=${id}`);
    const data = await res.json();

    return data?.results || [];
  } catch (err) {
    console.log(err)
  }
  
}

export async function getAll (id) {
  try {
    const res = await fetch(`${baseUrl}/categories`);
    const data = await res.json();

    return data?.results || [];
  } catch (err) {
    console.log(err)
  }
}