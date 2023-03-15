import { useEffect, useState } from "react"

let pressedSpace = false
export const useInput = () => {
    const [input, setInput] = useState({
        forward: false,
        backward: false,
        left: false,
        right: false,
        shift: false,
        // jump: false,
        wave: false,
    });

    const keys = {
        KeyW: 'forward',
        KeyS: 'backward',
        KeyA: 'left',
        KeyD: 'right',
        ShiftLeft: 'shift',
        Space: 'wave',
        // KeyE: 'wave',
    }

    const findKey = (key) => keys[key];

    useEffect(() => {
        
        const handleKeyDown = (e) => {
            if(e.target.tagName === "TEXTAREA"){
                return;
            }
            else{
                setInput((m) => ({...m, [findKey(e.code)]: true}))
            }
        }

        const handleKeyUp = (e) => {
            setInput((m) => ({...m, [findKey(e.code)]: false}))
        }

        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('keyup', handleKeyUp)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    return input;
}