import { API_URL } from '../config';
import { tSkill } from '@/types/skill';
import { APIErr } from '@/error/api';

export async function getSkills(): Promise<tSkill[]> {
    const url = `${API_URL}sk/a/`;
    const data = await fetch(url).then(res => res.ok ? res.json() : APIErr());
    return data;
}