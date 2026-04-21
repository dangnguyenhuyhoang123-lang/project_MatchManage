export const labelStats = (matchStats, safe, StatRow) => {
  return (
    <>
      <h2 className="text-center font-bold mb-6">THỐNG KÊ ĐỘI TUYỂN</h2>

      <StatRow
        left={safe(matchStats.shotsHome)}
        right={safe(matchStats.shotsAway)}
        label="Số lần sút"
      />

      <StatRow
        left={safe(matchStats.shotsOnTargetHome)}
        right={safe(matchStats.shotsOnTargetAway)}
        label="Sút trúng đích"
      />

      <StatRow
        left={safe(matchStats.possessionHome)}
        right={safe(matchStats.possessionAway)}
        label="Kiểm soát bóng"
      />

      <StatRow
        left={safe(matchStats.foulsHome)}
        right={safe(matchStats.foulsAway)}
        label="Phạm lỗi"
      />

      <StatRow
        left={safe(matchStats.yellowCardsHome)}
        right={safe(matchStats.yellowCardsAway)}
        label="Thẻ vàng"
      />

      <StatRow
        left={safe(matchStats.redCardsHome)}
        right={safe(matchStats.redCardsAway)}
        label="Thẻ đỏ"
      />

      <StatRow
        left={safe(matchStats.offsidesHome)}
        right={safe(matchStats.offsidesAway)}
        label="Việt vị"
      />

      <StatRow
        left={safe(matchStats.cornersHome)}
        right={safe(matchStats.cornersAway)}
        label="Phạt góc"
      />
    </>
  );
};
