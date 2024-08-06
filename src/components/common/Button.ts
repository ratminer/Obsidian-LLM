import { Colors } from "./Constants";
import styled from "styled-components";

export const Button = styled.button`
    padding: 10px 20px;
    background-color: ${Colors.BUTTON_COLOR};
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: ${Colors.BUTTON_COLOR};
    }
`
