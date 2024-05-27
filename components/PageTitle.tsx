import { Text } from "react-native";
import { Styles } from "@/constants/Styles"

type PageTitleProps = {
    title?: string;
}

export const PageTitle = ({
    title
}: PageTitleProps) => {
    return (
        <Text style={Styles.pageTitle}>
            {title}
        </Text>
    )
}