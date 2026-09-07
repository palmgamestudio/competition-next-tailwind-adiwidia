type SizeType = "small" | "normal";

type Props = {
    value: string,
    className?: string,
    size?: SizeType,
}

export default function Description({value, className, size = "normal"}: Props) {
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(value);
    const classNames = `description ${className ?? ""} ${size}`.trim();

    if (isHtml) {
        return (
            <div
                className={classNames}
                dangerouslySetInnerHTML={{ __html: value }}
            />
        );
    }

    return <p className={classNames}>{value}</p>;
}