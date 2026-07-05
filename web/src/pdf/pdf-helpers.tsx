import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ReactNode } from "react";

type TextStyle = Style | Style[];
import { styles } from "@/pdf/styles";

export function DoubleBorderBox({ children }: { children: ReactNode }) {
  return (
    <View style={styles.doubleBoxWrapper}>
      <View style={styles.doubleBoxOuter} />
      <View style={styles.doubleBoxInner} />
      <View style={styles.doubleBoxContent}>{children}</View>
    </View>
  );
}

/** 郵便番号(123-4567)の前に〒を付ける（既に付いていればスキップ）。 */
export function formatWithPostalMark(text: string): string {
  if (!text) {
    return text;
  }
  return text.replace(
    /(\d{3}-\d{4})/g,
    (match: string, _p1: string, offset: number, str: string) => {
      if (offset > 0 && str[offset - 1] === "〒") {
        return match;
      }
      return `〒${match}`;
    },
  );
}

/** 〒 は M PLUS 1 に無いため NotoSansJP で描画する。 */
export function TextWithPostalMark({ children, style }: { children: string; style: TextStyle }) {
  if (!children) {
    return null;
  }
  const parts = children.split(/(〒)/);
  if (parts.length === 1) {
    return <Text style={style}>{children}</Text>;
  }
  return (
    <Text style={style}>
      {parts.map((part, index) =>
        part === "〒" ? (
          <Text key={index} style={{ fontFamily: "NotoSansJP" }}>
            〒
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}
