import styled from "styled-components";
import { Colors } from "./Constants";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

const InputContainer = styled.div`
    display: flex;
    margin-bottom: 10px;
`

const TextArea = styled.textarea`
    flex: 1;
    padding: 10px;
    border: 1px solid ${Colors.BORDER_COLOR};
    border-radius: 5px;
    margin-right: 10px;
    margin-bottom: 10px;
    resize: vertical;
`

interface TextAreaProps {
    children: string
    onSetValue: (value: string) => void
    placeholder: string
    resetOnEnter?: boolean
}

export const TextAreaInput: React.FC<TextAreaProps> = ({ onSetValue, placeholder, children, resetOnEnter=false}) => {
    const [value, setValue] = useState("")
    const textAreaRef = useRef<any>(null)

    useEffect(() => {
        if (textAreaRef.current !== null) {
            textAreaRef.current.style.height = '0px'
            const scrollHeight = textAreaRef.current.scrollHeight
            textAreaRef.current.style.height = scrollHeight + 'px'
        }
    }, [value])

    function handleSetValue() {
        if (value.trim()) {
            onSetValue(value)
            setValue(value)
        }
    }

    function handleSubmit() {
        if (value.trim()) {
            onSetValue(value)
            if (resetOnEnter)
                setValue('')
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit()
            if (resetOnEnter)
                setValue('')
        }
    }

    return (
        <InputContainer>
            <TextArea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                onKeyDown={handleKeyDown}
                rows={4}
            />
            <Button onClick={handleSubmit}>{children}</Button>
        </InputContainer>
    )
}