import React from 'react';
import { tSkill } from '@/types/skill';
import { getSkills } from '@/api/skill/get';
import Skill from '@/components/Skill';

export default async function Page() {
    const skills = await getSkills()
    return (
        <>
            <h1 className="text-4xl font-black">Skills</h1>
            {skills.map((skill: tSkill) => (
                <Skill key={skill.id} {...skill}/>
            ))}
        </>
    );
}