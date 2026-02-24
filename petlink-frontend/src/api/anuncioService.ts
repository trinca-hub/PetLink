// src/api/anuncioService.ts
import { api } from "./api";

export async function getFeedPetinder(token?: string) {
  return api("Anuncio/feed/petinder", "GET", null, token);
}

export async function getFeedPetfinder(token?: string) {
  return api("Anuncio/feed/petfinder", "GET", undefined, token);
}

export async function getFeedPaypet(token?: string) {
  return api("Anuncio/feed/paypet", "GET", undefined, token);
}

export async function getAnuncioById(id: number | string, token?: string) {
  return api(`Anuncio/${id}`, "GET", null, token);
}

export async function createAnuncio(payload: any, token?: string) {
  return api("Anuncio", "POST", payload, token);
}
