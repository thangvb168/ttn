import { QuestionCircleOutlined } from "@ant-design/icons";
import { SelectLang as UmiSelectLang } from "@umijs/max";

export type SiderTheme = "light" | "dark";

export const SelectLang: React.FC = () => {
  return (
    <UmiSelectLang
      style={{
        padding: 4,
      }}
      postLocalesData={(locales) => {
        return [
          {
            lang: "vi-VN",
            label: "Tiếng Việt",
            icon: "🇻🇳",
            title: "Tiếng Việt",
          },
          {
            lang: "en-US",
            label: "English",
            icon: "🇺🇸",
            title: "English",
          },
        ];
      }}
    />
  );
};

export const Question: React.FC = () => {
  return (
    <a
      href="https://pro.ant.design/docs/getting-started"
      target="_blank"
      rel="noreferrer"
      style={{
        display: "inline-flex",
        padding: "4px",
        fontSize: "18px",
        color: "inherit",
      }}
    >
      <QuestionCircleOutlined />
    </a>
  );
};
