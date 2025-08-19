import { SERVER_URL } from '@/lib/const/';
import Image from 'next/image';
import { type tSkill } from '@/types/skill'

const Skill = ({name, yr, img}: tSkill) => {
    const size: number = 30;
    return (
        <>
            <div className='w-full mb-4 flex gap-2 justify-items-center items-center bg-white rounded-full p-5'>
                <Image src={`${SERVER_URL}${img}`} alt={name} width={size} height={size} loading='lazy' decoding='async'/>
                <p className='font-black'>{yr} yrs</p>
            </div>
        </>
    )
}

export default Skill
